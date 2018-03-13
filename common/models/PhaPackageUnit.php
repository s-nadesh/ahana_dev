<?php

namespace common\models;

use common\models\query\PhaPackageUnitQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pha_package_unit".
 *
 * @property integer $package_id
 * @property integer $tenant_id
 * @property string $package_name
 * @property string $package_unit
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoTenant $tenant
 */
class PhaPackageUnit extends PActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_package_unit';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['package_name', 'package_unit'], 'required'],
                [['tenant_id', 'created_by', 'modified_by'], 'integer'],
                [['status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['package_name'], 'string', 'max' => 255],
                [['package_unit'], 'string', 'max' => 100],
                [['package_name'], 'unique', 'targetAttribute' => ['tenant_id', 'package_name', 'package_unit', 'deleted_at'], 'message' => 'The combination has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'package_id' => 'Package ID',
            'tenant_id' => 'Tenant ID',
            'package_name' => 'Package Name',
            'package_unit' => 'Package Unit',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new PhaPackageUnitQuery(get_called_class());
    }

    public static function getPackinglist($tenant = null, $status = '1', $deleted = false) {
        if (!$deleted) {
            $list = self::find()->tenant($tenant)->status($status)->active()->all();
        } else {
            $list = self::find()->tenant($tenant)->deleted()->all();
        }

        return $list;
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Package Unit Added Successfully (#' . $this->package_name . ' )';
        else
            $activity = 'Package Unit Updated Successfully (#' . $this->package_name . ' )';
        CoAuditLog::insertAuditLog(PhaPackageUnit::tableName(), $this->package_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

}
