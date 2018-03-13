<?php

namespace common\models;

use common\models\query\PhaBrandDivisionQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pha_brand_division".
 *
 * @property integer $division_id
 * @property integer $tenant_id
 * @property string $division_name
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoTenant $tenant
 */
class PhaBrandDivision extends PActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_brand_division';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['division_name'], 'required'],
                [['tenant_id', 'created_by', 'modified_by'], 'integer'],
                [['status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['division_name'], 'string', 'max' => 255],
                [['division_name'], 'unique', 'targetAttribute' => ['tenant_id', 'division_name', 'deleted_at'], 'comboNotUnique' => 'The combination of Division Name has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'division_id' => 'Division ID',
            'tenant_id' => 'Tenant ID',
            'division_name' => 'Division Name',
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
        return new PhaBrandDivisionQuery(get_called_class());
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Brand Divison Added Successfully (#' . $this->division_name . ' )';
        else
            $activity = 'Brand Divison Updated Successfully (#' . $this->division_name . ' )';
        CoAuditLog::insertAuditLog(PhaBrandDivision::tableName(), $this->division_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

}
