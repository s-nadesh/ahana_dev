<?php

namespace common\models;

use common\models\query\PhaBrandQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pha_brand".
 *
 * @property integer $brand_id
 * @property integer $tenant_id
 * @property string $brand_name
 * @property string $brand_code
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoTenant $tenant
 */
class PhaBrand extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_brand';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['brand_name', 'brand_code'], 'required'],
            [['tenant_id', 'created_by', 'modified_by'], 'integer'],
            [['status'], 'string'],
            [['created_at', 'modified_at', 'deleted_at'], 'safe'],
            [['brand_name'], 'string', 'max' => 255],
            [['brand_code'], 'string', 'max' => 50],
            [['brand_name'], 'unique', 'targetAttribute' => ['tenant_id', 'brand_name', 'deleted_at'], 'comboNotUnique' => 'The combination of Brand Name has already been taken.'],
            [['brand_code'], 'unique', 'targetAttribute' => ['tenant_id', 'brand_code', 'deleted_at'], 'comboNotUnique' => 'The combination of Brand Code has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'brand_id' => 'Brand ID',
            'tenant_id' => 'Tenant ID',
            'brand_name' => 'Brand Name',
            'brand_code' => 'Brand Code',
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
        return new PhaBrandQuery(get_called_class());
    }
    
    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Brand Name Added Successfully (#' . $this->brand_name . ' )';
        else
            $activity = 'Brand Name Updated Successfully (#' . $this->brand_name . ' )';
        CoAuditLog::insertAuditLog(PhaBrand::tableName(), $this->brand_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }
}
